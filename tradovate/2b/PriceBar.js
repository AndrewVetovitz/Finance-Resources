const PriceBarColor = Object.freeze({
  Red: 0,
  Green: 1,
  Grey: 2,
});

module.exports = class PriceBar {
  Open() {
    return this.open;
  }

  Close() {
    return this.close;
  }

  High() {
    return this.high;
  }

  Low() {
    return this.low;
  }

  BodyHigh() {
    return IsGreen ? this.close : this.open;
  }

  BodyLow() {
    return IsRed ? this.close : this.open;
  }

  BodySize() {
    return IsGreen ? this.close - this.open : this.open - this.close;
  }

  WickSize() {
    return IsGreen ? this.high - this.close : this.high - this.open;
  }

  TailSize() {
    return IsGreen ? this.open - this.low : this.close - this.low;
  }

  TotalSize() {
    return this.high - this.low;
  }

  BarNumber() {
    return this.barNumber;
  }

  Time() {
    return this.time;
  }

  constructor(open, close, high, low, barNumber, time) {
    this.open = open;
    this.close = close;
    this.high = high;
    this.low = low;
    this.barNumber = barNumber;
    this.time = time;
  }

  color() {
    return this.open < this.close
      ? PriceBarColor.Green
      : this.open > this.close
      ? PriceBarColor.Red
      : PriceBarColor.Gray;
  }

  isGreen() {
    return this.open < this.close;
  }

  isRed() {
    return this.open > this.close;
  }

  isDoji() {
    return this.open == this.close;
  }

  isImbalance(previousBar) {
    return (
      previousBar.Low().IsBetween(this.BodyLow(), this.BodyHigh()) ||
      previousBar.High().IsBetween(this.BodyLow(), this.BodyHigh())
    );
  }

  //   imbalanceRange(previousBar) {
  //     if (previousBar.Low().IsBetween(this.BodyLow(), this.BodyHigh())) {
  //       return new PriceRange(previousBar.Low(), this.BodyHigh());
  //     } else if (previousBar.High().IsBetween(this.BodyLow(), this.BodyHigh())) {
  //       return new PriceRange(this.BodyLow(), previousBar.High());
  //     } else {
  //       return new PriceRange(0, 0);
  //     }
  //   }
};
