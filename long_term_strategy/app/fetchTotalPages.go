package main

import (
	"fmt"
	"log"
	"strconv"
	"strings"

	"github.com/gocolly/colly"
)

func GetTotalPages() int {
	var collector = colly.NewCollector()
	var totalPages int = -1

	collector.OnRequest(func(r *colly.Request) {
		fmt.Println("Visiting: ", r.URL)
	})

	collector.OnError(func(_ *colly.Response, err error) {
		log.Println("Something went wrong: ", err)
	})

	collector.OnHTML("option[selected=\"selected\"][value=\"1\"]", func(e *colly.HTMLElement) {
		var totalPagesArray = strings.Split(e.Text, "/")
		var totalPagesString = totalPagesArray[1]

		var totalPagesTest, err = strconv.Atoi(strings.TrimSpace(totalPagesString))
		if err != nil {
			panic(err)
		}

		totalPages = totalPagesTest
	})

	collector.Visit("http://finviz.com/screener.ashx?v=152&f=cap_smallover&ft=4&c=0,1,2,6,7,10,11,13,14,45,65")

	return totalPages
}