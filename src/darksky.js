module.exports = robot => {
  robot.respond(/weather ?(.+)?/i, async msg => {
    const location =
      msg.match[1] || process.env.HUBOT_DARK_SKY_DEFAULT_LOCATION;
    const options = {
      separator: process.env.HUBOT_DARK_SKY_SEPARATOR || "\n"
    };

    const googleurl = "https://maps.googleapis.com/maps/api/geocode/json";
    const q = {
      sensor: false,
      address: location,
      key: process.env.HUBOT_DARK_SKY_GOOGLE_GEOCODE_API_KEY
    };

    msg.http(googleurl).query(q).get((err, res, body) => {
      if (err) {
        msg.send(`A geocode API error occurred: ${err.message}`);
        msg.send(JSON.stringify(err));
        msg.send(JSON.stringify(res));
        return;
      }

      const result = JSON.parse(body);

      if (result.results.length > 0) {
        const { lat, lng } = result.results[0].geometry.location;

        darkSkyMe(msg, lat, lng, options.separator).then(darkSkyText => {
          const address = result.results[0].formatted_address;
          const poweredBy =
            "(Powered by DarkSky https://darksky.net/poweredby/)";

          const responseValue = darkSkyText.replace(
            /-?(\d+\.?\d*)°C/g,
            match => {
              const c = match.replace(/°C/, "");
              return (
                Math.round(c * 10) / 10 +
                "°C/" +
                Math.round(c * (9 / 5) + parseInt(32, 10)) +
                "°F"
              );
            }
          );

          msg.send(
            `Weather for ${address} ${poweredBy}${options.separator}${responseValue}${options.separator}`
          );
        });
      }
    });
  });

  function darkSkyMe(msg, lat, lng, separator) {
    return new Promise((resolve, reject) => {
      const url = `https://api.darksky.net/forecast/${process.env
        .HUBOT_DARK_SKY_API_KEY}/${lat},${lng}/?units=si`;

      msg.http(url).get((err, res, body) => {
        const result = JSON.parse(body);

        if (result.error) {
          return reject(result.error);
        }

        response = `Currently: ${result.currently.summary} ${result.currently
          .temperature}°C`;
        response += `${separator}Today: ${result.hourly.summary}`;
        response += `${separator}Coming week: ${result.daily.summary}`;

        return resolve(response);
      });
    });
  }
};
