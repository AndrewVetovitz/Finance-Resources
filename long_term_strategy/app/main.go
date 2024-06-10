package main

import (
	"fmt"
	"strconv"
)

type StockData struct {
	ticker string
	companyName string
	marketCap float64
	pricePerEarningsRatio string
	pricePerSalesRatio string
	pricePerBookRatio string
	pricePerCashFlowRatio string
	dividendYield string
	sixMonthRelativeStrength string 
	currentPrice string
    evebitda float64
    buyBackYield float64
}

func main() {
	var totalPages = GetTotalPages();

	fmt.Println("total pages: ", totalPages)

	var stockDataArray []StockData = []StockData{};

	for currentPage := 0; currentPage <= 0; currentPage++ {
		var pageUrl string = 
			"http://finviz.com/screener.ashx?v=152&f=cap_smallover&ft=4&c=0,1,2,6,7,10,11,13,14,45,65&r=" + strconv.Itoa(20 * currentPage + 1);
		stockDataArray = append(stockDataArray, GetFinvizData(pageUrl)...);
	}

    for i := 0; i < len(stockDataArray); i++ {
        var ticker = stockDataArray[i].ticker
		var pageUrl string = 
			"http://finance.yahoo.com/q/ks?s='" + ticker + "'+Key+Statistics";
        stockDataArray[i].evebitda = GetEVEBITDAData(pageUrl)
	}

    for i := 0; i < len(stockDataArray); i++ {
        var ticker = stockDataArray[i].ticker
		var pageUrl string = 
			"http://finviz.com/screener.ashx?v=152&f=cap_smallover&ft=4&c=0,1,2,6,7,10,11,13,14,45,65&r=" + ticker;
        stockDataArray[i].buyBackYield = GetBuyBackYieldData(pageUrl)
	}

	writeStockData(stockDataArray);
}
