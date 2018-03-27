function translate(text, from, to){
  return new Promise((resolve, reject) => {
    let headers = new Headers();
    headers.append("Content-Type", "application/json");
    fetch("https://us-central1-meta-router-115516.cloudfunctions.net/translate-something", {
      method: "POST",
      headers,
      body: JSON.stringify({
        from,
        to,
        text
      })
    })
      .then((response) => {
        response.json()
          .then(v => resolve(v.text))
          .catch(v => reject(v));
      })
      .catch((error) => {
        reject(error);
      });
  });
}

export { translate };
