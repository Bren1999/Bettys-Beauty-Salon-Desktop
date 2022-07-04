module.exports = {
    user          : process.env.NODE_ORACLEDB_USER || "system",
    password      : process.env.NODE_ORACLEDB_PASSWORD || "Pepsi12345",
    connectString : process.env.NODE_ORACLEDB_CONNECTIONSTRING || "localhost:1521/orcl",
    externalAuth  : process.env.NODE_ORACLEDB_EXTERNALAUTH ? true : false
  };