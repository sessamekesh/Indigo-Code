#include <stdio.h>

int main() {
	long m, n;

	while (scanf("%ld%ld", &m, &n) != EOF)
		printf("%ld\n", m * n - 1);

	return 0;
}
