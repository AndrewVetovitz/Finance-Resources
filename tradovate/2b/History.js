function History(period) {
  function history(value) {
    return history.push(value);
  }

  history.reset = () => {
    history.state = {
      items: [],
    };
  };

  history.push = (value) => {
    if (history.state.items.length >= period) {
      history.state.items.pop();
    }

    history.state.items.unshift(value);

    return history.state.items;
  };

  history.value = () => {
    return history.state.items;
  };

  history.length = () => {
    return history.state.items.length;
  };

  history.reset();

  return history;
}

module.exports = History;
