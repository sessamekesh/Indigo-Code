package main

import "fmt"

func fibb(n int64) int64 {
	if n < int64(2) {
		return int64(1)
	} else {
		n1, n2, curr := int64(1), int64(1), int64(2)
		for i := int64(2); i < n; i++ {
			n2 = n1
			n1 = curr
			curr = n1 + n2
		}
		return curr
	}
}

func main() {
	var n int64
	fmt.Scan(&n)
	for i := int64(0); i < n; i++ {
		var k int64
		fmt.Scan(&k)
		fmt.Println(fibb(k))
	}
}