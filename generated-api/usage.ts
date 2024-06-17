import { Configuration, DefaultApi } from '.'

// 配置API客户端
const config = new Configuration({ basePath: 'http://your.api.endpoint' })
const api = new DefaultApi(config)

// GET /
api.appControllerGetHello().then((response) => {
  console.log(response.data)
})

// POST /
api.appControllerPostHello().then((response) => {
  console.log(response.data)
})

// POST /botzone/create
api
  .botzoneControllerCreate({ example: 'exampleValue', this_is_a_test: 123 })
  .then((response) => {
    console.log(response.data)
  })
