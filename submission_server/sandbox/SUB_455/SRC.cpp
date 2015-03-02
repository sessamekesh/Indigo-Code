#include <iostream>
#include <assert.h>
using namespace std;

long long fibb(long long n) {
	if (n < 2) {
		return 1;
	} else {
		long long n1 = 1;
		long long n2 = 1;
		long long i = 2;
		long long curr = n1 + n2;
		for (; i < n; i++) {
			n2 = n1;
			n1 = curr;
			curr = n1 + n2;
		}
		return curr;
	}
}

int main() {
	long long thang;
	cin >> thang;

	for (long long i = 0; i < thang; i++) {
		long long foo;
		cin >> foo;
		cout << fibb(foo) << endl;
	}

	return 0;
}