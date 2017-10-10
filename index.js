process.env.DEBUG = 'swagger:*';

const util = require('util'),
    path = require('path'),
    config = require('./config'),
    customMiddlewares = require('./custom-middlewares'),
    express = require('express'),
    swagger = require('swagger-express-middleware'),
    Middleware = swagger.Middleware,
    MemoryDataStore = swagger.MemoryDataStore,
    Resource = swagger.Resource;

const tables = require('./init-data/');

const app = express();

const initMiddleware = (appInstance, swaggerFile) => {
    const middleware = new Middleware(appInstance);
    return new Promise((resolve, reject) => {
        middleware.init(swaggerFile, (err, a, b, c) => {
            if (err) {
                reject(err);
            } else {
                app.swagger = b;
                resolve(middleware);
            }
        });
    });
};

const initDB = (dataStore, tables) => {
    tables.map((table) => {
        const url = `${config.prefixApi}/${table.name}`;
        const resources = Array.isArray(table.data) ?
            table.data.map((row) => new Resource(getApiUrl(url, table.key, row[table.key]), row)) :
            new Resource(getApiUrl(url, table.key, table.key), table.data);

        dataStore.save(resources);
    });
}

const getApiUrl = (url, key, value) => {
    let apiUrl = url;
    if (key) {
        apiUrl += `/${value}`;
    }
    return apiUrl;
}

const initMockServer = (middleware) => {

    const dataStore = new MemoryDataStore();
    // Enable Express' case-sensitive and strict options
    // (so "/pets/Fido", "/pets/fido", and "/pets/fido/" are all different)
    app.enable('case sensitive routing');
    app.enable('strict routing');

    // init database
    initDB(dataStore, tables);

    app.use(middleware.metadata());

    app.use(middleware.files(
        {
            // Override the Express App's case-sensitive and strict-routing settings
            // for the Files middleware.
            caseSensitive: false,
            strict: false
        },
        {
            // Serve the Swagger API from "/swagger/api" instead of "/api-docs"
            apiPath: '/swagger/api',

            // Disable serving the "PetStore.yaml" file
            rawFilesPath: false
        }
    ));

    app.use(middleware.parseRequest(
        {
            // Configure the cookie parser to use secure cookies
            cookie: {
                secret: config.cookieSecret
            },

            // Don't allow JSON content over 100kb (default is 1mb)
            json: {
                limit: config.jsonLimit
            },

            // Change the location for uploaded pet photos (default is the system's temp directory)
            multipart: {
                dest: path.join(__dirname, config.uploadFolder)
            }
        }
    ));

    // These two middleware don't have any options (yet)
    app.use(
        middleware.CORS(),
        middleware.validateRequest()
    );
    app.db = dataStore;
    customMiddlewares(app);

    // The mock middleware will use our custom data store,
    // which we already pre-populated with mock data
    app.use(middleware.mock(dataStore));

    // Add a custom error handler that returns errors as HTML
    app.use(function (err, req, res, next) {
        res.status(err.status);
        res.type('html');
        res.send(util.format('<html><body><h1>%d Error!</h1><p>%s</p></body></html>', err.status, err.message));
    });

    app.listen(config.port, function () {
        console.log('The mock server is now running at http://localhost:' + config.port);
    });
};

initMiddleware(app, config.yamlFile).then(initMockServer, (err) => {
    console.log(err);
});

