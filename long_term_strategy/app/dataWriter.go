package main

import (
	"fmt"
	"os"
	"strconv"
)

func (data StockData) String() string {
	return data.ticker + "," + data.companyName + "," + strconv.FormatFloat(data.marketCap, 'f', -1, 64) + "," + data.pricePerEarningsRatio + "," + data.pricePerSalesRatio + "," + data.pricePerBookRatio + "," + data.pricePerCashFlowRatio + "," + data.dividendYield + "," + data.sixMonthRelativeStrength + "," + data.currentPrice + "," + strconv.FormatFloat(data.evebitda, 'f', -1, 64) + "," + strconv.FormatFloat(data.buyBackYield, 'f', -1, 64);
}

func writeStockData(data []StockData) {
	var file, err = os.Create("../data.txt")
	if err != nil {
		fmt.Println(err)
		return
	}

	_, err = file.WriteString("ticker,companyName,marketCap,pricePerEarningsRatio,PricePerSalesRatio,pricePerBookRatio,pricePerCashFlowRatio,dividendYield,sixMonthRelativeStrength,currentPrice,EV/EBITDA,buyBackYield\n")
	if err != nil {
		fmt.Println(err)
		file.Close()
		return
	}
	//fmt.Println(bytes, "bytes written successfully")

	for _, row := range(data) {
		;
		_, err := file.WriteString(fmt.Sprintln(row))
		if err != nil {
			fmt.Println(err)
			file.Close()
			return
		}
		//fmt.Println(bytes, "bytes written successfully")
	}
	
	err = file.Close()
	if err != nil {
		fmt.Println(err)
		return
	}
}
