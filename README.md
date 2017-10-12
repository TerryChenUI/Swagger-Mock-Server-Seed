# swagger-mock-server-seed

## 前后端分离模式
现在大部分团队都采用前后端分离的开发模式中，那么在做 feaure 开发前，前端和后端需要协同定义 Restful API 接口的数据格式，就可以各自开干了。

对于前端开发人员，需要通过发送Http请求来操作数据，但此时后端人员并没有完成相关接口的开发，所以我们可以配置 mock server 来处理数据的回调。


## swagger-express-middleware
目前的团队使用 swaager 协议编写 API 文档，通常我们配置 mock server，使用 express 服务器，对照 API 文档写对应的接口。例如

**swagger api 文档：**
```
'/sharedcontacts/{id}':
	get:
	  consumes:
	    - application/json
	  produces:
	    - application/json
	  parameters:
	    - in: path
	      name: id
	      required: true
	      type: string
	  responses:
	    '200':
	      description: Success
	      schema:
	        required:
            - name
            - organizationalUnit
          type: object
          properties:
            id:
              required: false
              type: string
              description: Identity of the shared contact
            name:
              required: true
              type: string
              description: Name of the shared contact
            organizationalUnit:
              required: true
              type: string
              description: Organizational Unit of the shared contact
```
**express 实现：**
```
app.get('/api/v1/sharedcontacts', (req, res, next) => {
    const data = {
      "id": "1",
      "name": "test-name-1",
      "organizationalUnit": "test-ou-1"
    };
    res.send(data);
});
```

问题：当 API 接口越来越多时， 对应的 express mock server 也越来越大，同时会有大量重复的 CURD 的操作。

为了简化这个 mock server，在 github 上找到一个强大开源的框架 swagger-express-middleware，这个框架主要逻辑是根据 swagger 文档的定义， 统一封装 CURD 的操作。

**框架特点：**
* 支持 Swagger 2.0 JSON 和 YAML 两种格式
* 全面覆盖的测试
* 模拟中间件：通过配置，实现零代码操作数据
* 解析请求中间件
* 验证请求中间件
* 跨域中间件
* 文件中间件

更多介绍和使用请参考[swagger-express-middleware](https://github.com/BigstickCarpet/swagger-express-middleware) 

## swagger-mock-server-seed 脚手架
swagger-mock-server-seed 是根据 swagger-express-middleware 框架创建的脚手架。

### 安装教程 ###
1. fork 或 clone 项目，执行 npm install
2. 执行 npm run start 启动项目，默认是8000端口，通过 localhost:8000/api/v1/sharedcontacts 访问即可

### 数据初始化 ###
swagger-express-middleware 框架将数据保存到 MemoryDataStore 中，所以当每次启动项目时，都会是新的 Database。

如果需要插入初始化的数据，swagger-express-middle 提供的方式为
```
var myDB = new MemoryDataStore();
myDB.save(
  // url: '/pets/:name', data: {}
  new Resource('/pets/Lassie', {name: 'Lassie', type: 'dog', tags: ['brown', 'white']}),
  new Resource('/pets/Clifford', {name: 'Clifford', type: 'dog', tags: ['red', 'big']}),
  new Resource('/pets/Garfield', {name: 'Garfield', type: 'cat', tags: ['orange']}),
  new Resource('/pets/Snoopy', {name: 'Snoopy', type: 'dog', tags: ['black', 'white']}),
  new Resource('/pets/Hello%20Kitty', {name: 'Hello Kitty', type: 'cat', tags: ['white']})
);
```


这样的初始化数据的方式比较麻烦，并且要改到核心代码，所以在 swagger-mock-server-seed 做了扩展，通过配置的方式初始化数据，只需要添加 json 文件并且修改配置文件即可。
```
// index.js
/**
 * Tables
 * name: api/v1/{name}
 * key:  api/v1/{name}/{key} | optional 
 * data: array or string
 */
module.exports = [{
  name: 'sharedcontacts',
  key: 'id', // 指对象中 id 的值
  data: require('./shared-contacts.json')
}];

// shared-contacts.json
[
  {
    "id": "1",
    "name": "test-name-1",
    "organizationalUnit": "test-ou-1"
  },
  {
    "id": "2",
    "name": "test-name-2",
    "organizationalUnit": "test-ou-2"
  },
  {
    "id": "3",
    "name": "test-name-3",
    "organizationalUnit": "test-ou-3"
  }
]
```


### 自定义 Route ###
swagger-mock-server-seed 脚手架同样对 Url Route 做了扩展。

1. swagger-express-middleware 提供的 CURD 操作并不能满足我们的需求时，我们可以重写 Url Route，返回自定义的数据格式。
2. 当 swagger api 文档没有定义我们需要的 API 时，我们也可以自定义 Url Route。

```
/**
 * Custom api
 */

const config = require('../config');

module.exports = (app) => {
    // overload swagger api definition
    app.use(`${config.prefixApi}/sharedcomputers`, require('./shared-computers'));

    // other api definition
    app.use('/api/v2/settings', require('./settings'));
};
```

## Swagger 相关参考
* [Swagger 主页](https://swagger.io/)
* [Swagger从入门到精通](https://www.gitbook.com/book/huangwenchao/swagger/details)

开发过程中，如果我们使用Swagger编写API文档，



