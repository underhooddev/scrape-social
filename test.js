fetch("http://localhost:8080/v1/tweets/", {
  method: "POST",
  body: JSON.stringify({
    url: "https://x.com/danielcranney/status/1706793438903947648",
  }),
  headers: {
    "Content-Type": "application/json",
  },
}).then(async (rs) => {
  console.log(await rs.json());
});
