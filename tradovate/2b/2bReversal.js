const predef = require("./tools/predef");
const PriceBar = require("./PriceBar");
const History = require("./History");

const SwingType = Object.freeze({
  High: 0,
  Low: 1,
});

class TwoBReversal {
  init() {
    this.PivotPeriod = this.props.pivotPeriod; // Set the pivot period
    this.UseWilliams = this.props.useWilliams; // Use Williams fractals instead of regular fractals
    this.AlwaysShowPivotBreaks = this.props.alwaysShowPivotBreaks; // Always show pivot breaks, even when no reversal is indicated
    this.MaxBreakLength = this.props.maxBreakLength; // Set the maximum bars until the pattern should be completed. This means establishing a limit on the number of bars allowed for the completion of the pattern. A high value returns more signals
    this.MinBreakLength = this.props.minBreakLength; // Set the minimum bars before the breakout. This means establishing a minimum number of bars that must be completed before the breakout. A low value returns more signals
    this.BreakoutUpColor = this.props.breakoutUpColor; // Breakout up color
    this.BreakoutDownColor = this.props.breakoutDownColor; // Breakout down color

    this.BreakingBar = null;
    this.ReverseConfirmationBar = null;
    this.Open = History(this.PivotPeriod * 2 + 1);
    this.Close = History(this.PivotPeriod * 2 + 1);
    this.Low = History(this.PivotPeriod * 2 + 1);
    this.High = History(this.PivotPeriod * 2 + 1);
    this.Time = History(this.PivotPeriod * 2 + 1);
    this.swingPoints = [];
    this.LastSwingHigh = null;
    this.LastSwingLow = null;
  }

  map(d, index) {
    this.Open(d.open());
    this.Close(d.close());
    this.High(d.high());
    this.Low(d.low());
    this.Time(d.timestamp());

    if (index < this.PivotPeriod * 2 + 1) {
      return;
    }

    let isSwingHigh = this.UseWilliams
      ? this.isWilliamsSwing(SwingType.High)
      : this.isRegularSwing(SwingType.High);
    let isSwingLow = this.UseWilliams
      ? this.isWilliamsSwing(SwingType.Low)
      : this.isRegularSwing(SwingType.Low);

    let swingPriceBar = new PriceBar(
      this.Open.value()[this.PivotPeriod],
      this.Close.value()[this.PivotPeriod],
      this.High.value()[this.PivotPeriod],
      this.Low.value()[this.PivotPeriod],
      index - this.PivotPeriod,
      this.Time.value()[this.PivotPeriod]
    );

    if (isSwingHigh) {
      this.swingPoints.push(new SwingPoint(SwingType.High, swingPriceBar));
    }

    if (isSwingLow) {
      this.swingPoints.push(new SwingPoint(SwingType.Low, swingPriceBar));
    }

    let priceBar = new PriceBar(
      this.Open.value()[0],
      this.Close.value()[0],
      this.High.value()[0],
      this.Low.value()[0],
      index,
      this.Time.value()[0]
    );
    this.LastSwingHigh = this.swingPoints.findLast(
      (s) => s.SwingType == SwingType.High
    );
    this.LastSwingLow = this.swingPoints.findLast(
      (s) => s.SwingType == SwingType.Low
    );
    let lastBrokenSwingHigh = this.swingPoints.findLast(
      (s) => s.SwingType == SwingType.High && s.BreakingBar != null
    );
    let lastBrokenSwingLow = this.swingPoints.findLast(
      (s) => s.SwingType == SwingType.Low && s.BreakingBar != null
    );

    const items = [];

    // See if the last swing high was broken by price.
    if (this.LastSwingHigh != null) {
      if (this.LastSwingHigh.BreakingBar == null) {
        if (priceBar.High > this.LastSwingHigh.PriceBar.High) {
          this.LastSwingHigh.SetBreakingBar(priceBar);

          if (this.AlwaysShowPivotBreaks) {
            let linePrice = this.LastSwingHigh.PriceBar.High;
            // items.push({
            //     tag: "Text",
            //     key: "ex",
            //     point: {
            //      x: op(du(d.index()), "-", px(0)),
            //      y: op(du(d.high()), "-", px(15)),
            //     },
            //     text: "*\n" + truncatedAtr,
            //     style: {
            //     fontSize: 24,
            //     fontWeight: "bold",
            //     fill: this.ShortBrushColor,
            //     },
            //     textAlignment: "centerMiddle",
            // });

            // Draw.Line(
            //   this,
            //   "swingHighBroken" + CurrentBar,
            //   this.IsAutoScale,
            //   CurrentBar - this.LastSwingHigh.PriceBar.BarNumber,
            //   linePrice,
            //   0,
            //   linePrice,
            //   this.BreakoutUpColor,
            //   DashStyleHelper.Dash,
            //   1
            // );
          }
        }
      }
    }

    // See if the last swing low was broken by price.
    if (this.LastSwingLow != null) {
      if (this.LastSwingLow.BreakingBar == null) {
        if (priceBar.Low < this.LastSwingLow.PriceBar.Low) {
          this.LastSwingLow.SetBreakingBar(priceBar);
          if (this.AlwaysShowPivotBreaks) {
            let linePrice = this.LastSwingLow.PriceBar.Low;
            // Draw.Line(
            //   this,
            //   "swingLowBroken" + CurrentBar,
            //   this.IsAutoScale,
            //   CurrentBar - this.LastSwingLow.PriceBar.BarNumber,
            //   linePrice,
            //   0,
            //   linePrice,
            //   this.BreakoutDownColor,
            //   DashStyleHelper.Dash,
            //   1
            // );
          }
        }
      }
    }

    if (lastBrokenSwingHigh != null) {
      if (lastBrokenSwingHigh.ReverseConfirmationBar == null) {
        let barsAgo = CurrentBar - lastBrokenSwingHigh.BreakingBar.BarNumber;
        if (lastBrokenSwingHigh.isReverseConfirmed(priceBar)) {
          let linePrice = lastBrokenSwingHigh.BreakingBar.Low;
          let brokenPrice = lastBrokenSwingHigh.PriceBar.High;
          if (barsAgo.IsBetween(this.MinBreakLength, this.MaxBreakLength)) {
            if (!this.AlwaysShowPivotBreaks) {
              //   Draw.Line(
              //     this,
              //     "swingHighBroken" + CurrentBar,
              //     this.IsAutoScale,
              //     CurrentBar - lastBrokenSwingHigh.PriceBar.BarNumber,
              //     brokenPrice,
              //     CurrentBar - lastBrokenSwingHigh.BreakingBar.BarNumber,
              //     brokenPrice,
              //     this.BreakoutUpColor,
              //     DashStyleHelper.Dash,
              //     1
              //   );
            }
            // Draw.Line(
            //   this,
            //   "breakoutDown" + CurrentBar,
            //   this.IsAutoScale,
            //   barsAgo,
            //   linePrice,
            //   0,
            //   linePrice,
            //   this.BreakoutDownColor,
            //   DashStyleHelper.Solid,
            //   1
            // );
            // Draw.TriangleDown(
            //   this,
            //   "breakoutDownSymbol" + CurrentBar,
            //   this.IsAutoScale,
            //   0,
            //   priceBar.High + this.ArrowDistance,
            //   this.BreakoutDownColor
            // );
          }
        }
      }
    }

    if (lastBrokenSwingLow != null) {
      if (lastBrokenSwingLow.ReverseConfirmationBar == null) {
        let barsAgo = CurrentBar - lastBrokenSwingLow.BreakingBar.BarNumber;
        if (lastBrokenSwingLow.isReverseConfirmed(priceBar)) {
          let linePrice = lastBrokenSwingLow.BreakingBar.High;
          let brokenPrice = lastBrokenSwingLow.PriceBar.Low;
          if (barsAgo.IsBetween(this.MinBreakLength, this.MaxBreakLength)) {
            if (!this.AlwaysShowPivotBreaks) {
              //   Draw.Line(
              //     this,
              //     "swingLowBroken" + CurrentBar,
              //     this.IsAutoScale,
              //     CurrentBar - lastBrokenSwingLow.PriceBar.BarNumber,
              //     brokenPrice,
              //     CurrentBar - lastBrokenSwingLow.BreakingBar.BarNumber,
              //     brokenPrice,
              //     this.BreakoutDownColor,
              //     DashStyleHelper.Dash,
              //     1
              //   );
            }
            // Draw.Line(
            //   this,
            //   "breakoutUp" + CurrentBar,
            //   this.IsAutoScale,
            //   barsAgo,
            //   linePrice,
            //   0,
            //   linePrice,
            //   this.BreakoutUpColor,
            //   DashStyleHelper.Solid,
            //   1
            // );
            // Draw.TriangleUp(
            //   this,
            //   "breakoutUpSymbol" + CurrentBar,
            //   this.IsAutoScale,
            //   0,
            //   priceBar.Low - this.ArrowDistance,
            //   this.BreakoutUpColor
            // );
          }
        }
      }
    }

    return {
      graphics: {
        items,
      },
    };
  }

  isRegularSwing(fractalType) {
    let isSwing = true;

    for (let i = 0; i < this.PivotPeriod; i++) {
      if (fractalType == SwingType.High) {
        isSwing =
          this.High.value()[this.PivotPeriod + i] >
            this.High.value()[this.PivotPeriod + i + 1] &&
          this.High.value()[this.PivotPeriod - i] >
            this.High.value()[this.PivotPeriod - i - 1];
      } else {
        isSwing =
          this.Low.value()[this.PivotPeriod + i] <
            this.Low.value()[this.PivotPeriod + i + 1] &&
          this.Low.value()[this.PivotPeriod - i] <
            this.Low.value()[this.PivotPeriod - i - 1];
      }

      if (!isSwing) {
        break;
      }
    }

    return isSwing;
  }

  isWilliamsSwing(fractalType) {
    let isSwing = true;

    for (let i = 0; i < this.PivotPeriod; i++) {
      if (fractalType == SwingType.High) {
        if (i == 0) {
          isSwing =
            this.High.value()[this.PivotPeriod] >
              this.High.value()[this.PivotPeriod + i + 1] &&
            this.High.value()[this.PivotPeriod] >
              this.High.value()[this.PivotPeriod - i - 1];
        } else {
          isSwing =
            this.High.value()[this.PivotPeriod] >=
              this.High.value()[this.PivotPeriod + i + 1] &&
            this.High.value()[this.PivotPeriod] >=
              this.High.value()[this.PivotPeriod - i - 1];
        }
      } else {
        if (i == 0) {
          isSwing =
            this.Low.value()[this.PivotPeriod] <
              this.Low.value()[this.PivotPeriod + i + 1] &&
            this.Low.value()[this.PivotPeriod] <
              this.Low.value()[this.PivotPeriod - i - 1];
        } else {
          isSwing =
            this.Low.value()[this.PivotPeriod] <=
              this.Low.value()[this.PivotPeriod + i + 1] &&
            this.Low.value()[this.PivotPeriod] <=
              this.Low.value()[this.PivotPeriod - i - 1];
        }
      }

      if (!isSwing) {
        break;
      }
    }

    return isSwing;
  }
}

class SwingPoint {
  constructor(swingType, priceBar, confirmBreakWithBody = true) {
    this.SwingType = swingType;
    this.PriceBar = priceBar;
    this.BreakingBar = null;
    this.ReverseConfirmationBar = null;
    this.ConfirmBreakWithBody = confirmBreakWithBody;
  }

  isReverseConfirmed(priceBar) {
    let result = false;

    if (this.BreakingBar != null) {
      if (this.SwingType == SwingType.High) {
        let confirmationPrice = this.ConfirmBreakWithBody
          ? priceBar.BodyLow()
          : priceBar.Low();
        result = confirmationPrice < this.BreakingBar.Low;
      } else {
        let confirmationPrice = this.ConfirmBreakWithBody
          ? priceBar.BodyHigh()
          : priceBar.High();
        result = confirmationPrice > this.BreakingBar.High;
      }
    }

    if (result) {
      this.ReverseConfirmationBar = priceBar;
    }

    return result;
  }
}

module.exports = {
  name: "2B Reversal",
  description: "2b reversal indicator",
  tags: ["Andrew.Vetovitz"],
  calculator: TwoBReversal,
  params: {
    pivotPeriod: predef.paramSpecs.period(2),
    useWilliams: predef.paramSpecs.bool(false),
    alwaysShowPivotBreaks: predef.paramSpecs.bool(false),
    maxBreakLength: predef.paramSpecs.period(20),
    minBreakLength: predef.paramSpecs.period(5),
    breakoutUpColor: predef.paramSpecs.color("#5c5"),
    breakoutDownColor: predef.paramSpecs.color("#c23b22"),
  },
};
