export function binaryResponseParser (res :any, cb: any) : void {
    res.setEncoding("binary");
    res.data = "";
    res.on("data", (chunk :any) => {
      res.data += chunk;
    });
    res.on("end", () => {
      cb(null, new Buffer(res.data, "binary"));
    });
  };
  