# Over View [![Build Status](https://drone.whileaway.io/api/badges/ThisSeanZhang/gpt-ui/status.svg)](https://drone.whileaway.io/ThisSeanZhang/gpt-ui)
A Very Simple GPT PAI UI 

# Demo
![](./docs/20230309153623.png)

# Plan
- [x] 可以使用自己的 API key
- [x] 可以自定义想要的设定
- [x] 可以选择哪些作为对话上下文
- [x] 支持对话的导出导入
- [x] 优化 UI
- [x] 支持模型的选择

# Next
- [ ] 支持其他 API
...

# Deploy
## Docker Image
```shell
docker pull thisseanzhang/gpt-ui:0.0.1

docker run --rm -p 65525:65525 thisseanzhang/gpt-ui:0.0.1
```

if want more info
```shell
docker run --rm thisseanzhang/gpt-ui:0.0.1 ./backend --help

Usage: backend [OPTIONS]

Options:
  -w, --web-path <WEB_PATH>
      --addr <IP:PORT>        [default: 0.0.0.0:65525]
      --log-level <LogLevel>  [default: info]
  -h, --help                  Print help

```

# License
This project is licensed under [MIT license](https://github.com/ThisSeanZhang/gpt-ui/blob/main/LICENSE).
