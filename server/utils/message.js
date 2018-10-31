const generateMessage = (from, text) => ({
  from,
  text,
  createAt: new Date()
});

const generateLocationMessage = coords => {
  const { from, latitude, longitude } = coords;
  return {
    from,
    url: `https://google.com/maps?q=${latitude},${longitude}`,
    createAt: new Date()
  }
};

module.exports = { generateMessage, generateLocationMessage };
