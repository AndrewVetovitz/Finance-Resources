const EMA = require("./tools/EMA");
const { op, px, du } = require("./tools/graphics");
const MMA = require("./tools/MMA");
const trueRange = require("./tools/trueRange");
const predef = require("./tools/predef");

const PositionType = Object.freeze({
  Long: 0,
  Short: 1,
});

const BarPositionOverEma = Object.freeze({
  PartialBody: 0,
  FullBody: 1,
  FullBar: 2,
});

class Scalper {
  init() {
    this.UseEma = true; // EMA should be used to determine setups
    this.BarPosition = BarPositionOverEma.PartialBody; // Specifies what part of the bar must be over/under the EMA
    this.UseAtr = true; //ATR should be used to determine setup
    this.AtrMinimum = this.props.minAtr; // Minimum value for the ATR
    this.LongBrushColor = this.props.longIndicator; // Color to use to indicate a long setup
    this.ShortBrushColor = this.props.shortIndicator; // Color to use to indicate a short setup
    this.ema = EMA(this.props.emaPeriod);
    this.movingAverage = MMA(this.props.atrPeriod);
  }

  map(d, _i, history) {
    if (!d.isComplete()) {
      return;
    }

    this.ema(d.value());

    if (!history || !history.prior() || !history.prior().value()) {
      return;
    }

    this.Open = [d.open(), history.prior().open()];
    this.Close = [d.close(), history.prior().close()];
    this.Low = [d.low(), history.prior().low()];
    this.High = [d.high(), history.prior().high()];
    const atr = this.customAtr(d, history);

    if (!this.UseAtr || atr > this.AtrMinimum) {
      let isPossibleShort =
        this.Low[1] < this.Low[0] &&
        this.High[1] < this.High[0] &&
        this.isRedBar(0);
      if (this.UseEma) {
        isPossibleShort =
          isPossibleShort && this.barClearedEma(PositionType.Short);
      }

      let isPossibleLong =
        this.Low[1] > this.Low[0] &&
        this.High[1] > this.High[0] &&
        this.isGreenBar(0);
      if (this.UseEma) {
        isPossibleLong =
          isPossibleLong && this.barClearedEma(PositionType.Long);
      }

      const truncatedAtr = Math.trunc((atr / 2.0) * 100) / 100;

      if (isPossibleShort) {
        return {
          graphics: {
            items: [
              {
                tag: "Text",
                key: "ex",
                point: {
                  x: op(du(d.index()), "-", px(0)),
                  y: op(du(d.high()), "-", px(15)),
                },
                text: "*\n" + truncatedAtr,
                style: {
                  fontSize: 24,
                  fontWeight: "bold",
                  fill: this.ShortBrushColor,
                },
                textAlignment: "centerMiddle",
              },
            ],
          },
        };
      } else if (isPossibleLong) {
        return {
          graphics: {
            items: [
              {
                tag: "Text",
                key: "ex",
                point: {
                  x: op(du(d.index()), "-", px(0)),
                  y: op(du(d.low()), "+", px(25)),
                },
                text: "*\n" + truncatedAtr,
                style: {
                  fontSize: 24,
                  fontWeight: "bold",
                  fill: this.LongBrushColor,
                },
                textAlignment: "centerMiddle",
              },
            ],
          },
        };
      }
    }
  }

  barClearedEma(positionType) {
    let result = false;

    switch (this.BarPosition) {
      case BarPositionOverEma.PartialBody: {
        if (positionType == PositionType.Long) {
          result = this.Close[0] > this.ema.avg();
        } else {
          result = this.Close[0] < this.ema.avg();
        }

        break;
      }
      case BarPositionOverEma.FullBody: {
        if (positionType == PositionType.Long) {
          result = this.Open[0] > this.ema[0] && this.Close[0] > this.ema.avg();
        } else {
          result = this.Open[0] < this.ema[0] && this.Close[0] < this.ema.avg();
        }

        break;
      }
      case BarPositionOverEma.FullBar: {
        if (positionType == PositionType.Long) {
          result = this.Low[0] > this.ema.avg();
        } else {
          result = this.High[0] < this.ema.avg();
        }

        break;
      }
      default:
        break;
    }

    return result;
  }

  isGreenBar(barIndex) {
    return this.Open[barIndex] < this.Close[barIndex];
  }

  isRedBar(barIndex) {
    return this.Open[barIndex] > this.Close[barIndex];
  }

  customAtr(d, history) {
    return this.movingAverage(trueRange(d, history.prior()));
  }
}

module.exports = {
  name: "Scalper",
  description: "scalper indicator",
  tags: ["Andrew.Vetovitz"],
  calculator: Scalper,
  params: {
    longIndicator: predef.paramSpecs.color("#5c5"),
    shortIndicator: predef.paramSpecs.color("#c23b22"),
    atrPeriod: predef.paramSpecs.period(10), // Period to use for calculating the ATR
    emaPeriod: predef.paramSpecs.period(10), // Period to use for calculating the EMA
    minAtr: predef.paramSpecs.period(5),
  },
};
