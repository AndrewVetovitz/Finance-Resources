package main

import (
	"fmt"
	"log"
	"strconv"
	"strings"

	"github.com/gocolly/colly"
)

func GetFinvizData(url string) []StockData {
	var collector = colly.NewCollector()
	var data []StockData;

	collector.OnRequest(func(r *colly.Request) {
		fmt.Println("Visiting: ", r.URL)
	})

	collector.OnError(func(_ *colly.Response, err error) {
		log.Println("Something went wrong: ", err)
	})

	collector.OnHTML("tr[valign=\"top\"]", func(row *colly.HTMLElement) {
		var stockRowData StockData;
		row.ForEach("td", func(index int, column *colly.HTMLElement) {
			switch index {
				case 1: { // ticker
					stockRowData.ticker = column.Text;
				}
				case 2: { // Company name
					stockRowData.companyName = column.Text;
				}
				case 3: { // Market Cap
					var multiplier = 1.0;
					if strings.Contains(column.Text, "B") {
						multiplier = 1000000000
					} else {
						multiplier = 1000000
					}

					var rawMarketCapString = strings.TrimSpace(column.Text);
					var cleanedText = rawMarketCapString[0:len(rawMarketCapString) - 1]
					var marketCapString, err = strconv.ParseFloat(cleanedText, 64)
					if err != nil {
						panic(err)
					}
			
					stockRowData.marketCap = marketCapString * multiplier;
				}
				case 4: { // Price/Earnings Ratio
					stockRowData.pricePerEarningsRatio = column.Text;
				}
				case 5: { // Price/Sales Ratio
					stockRowData.pricePerSalesRatio = column.Text;
				}
				case 6: { // Price/Book Ratio
					stockRowData.pricePerBookRatio = column.Text;
				}
				case 7: { // Price/Free Cash Flow Ratio
					stockRowData.pricePerCashFlowRatio = column.Text;
				}
				case 8: { // Dividend Yield
					stockRowData.dividendYield = column.Text;
				}
				case 9: { // 6-month relative price strength
					stockRowData.sixMonthRelativeStrength = column.Text;
				}
				case 11: { // Current stock price
					stockRowData.currentPrice = column.Text;
				}
			}
		})

		data = append(data, stockRowData);
	})

	collector.Visit(url)

	return data
}