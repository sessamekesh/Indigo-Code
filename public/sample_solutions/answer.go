package main

import "fmt"

func main() {
	var i int
	fmt.Scan(&i)
	for i > 0 {
		fmt.Println("42")
		i--
	}
}