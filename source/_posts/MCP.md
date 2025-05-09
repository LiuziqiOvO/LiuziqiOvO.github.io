## MCP Debugging  调试

[原文](https://github.com/microsoft/markitdown/tree/main/packages/markitdown-mcp#debugging)

To debug the MCP server you can use the `mcpinspector` tool.  
要调试 MCP 服务器，您可以使用 `mcpinspector` 工具。

```shell
npx @modelcontextprotocol/inspector
```

You can then connect to the insepctor through the specified host and port (e.g., `http://localhost:5173/`).  
然后，您可以通过指定的主机和端口连接到检查器（例如， `http://localhost:5173/` ）。

If using STDIO:  如果使用 STDIO：

- select `STDIO` as the transport type,  
    选择 `STDIO` 作为传输类型，
- input `markitdown-mcp` as the command, and  
    输入 `markitdown-mcp` 作为命令，并且
- click `Connect`  点击 `Connect`

If using SSE:  如果使用 SSE：

- select `SSE` as the transport type,  
    选择 `SSE` 作为传输类型，
- input `http://127.0.0.1:3001/sse` as the URL, and  
    输入 `http://127.0.0.1:3001/sse` 作为 URL，然后
- click `Connect`  点击 `Connect`

Finally:  最后：

- click the `Tools` tab,  点击 `Tools` 选项卡，
- click `List Tools`,  点击 `List Tools` ，
- click `convert_to_markdown`, and  点击 `convert_to_markdown` ，然后
- run the tool on any valid URI.  
    运行工具对任何有效 URI 进行操作。