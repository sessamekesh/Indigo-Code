#include <iostream>

int fibb(int n)
{
	if (n < 2)
	{
		return 1;
	}
	else
	{
		return fibb(n - 1) + fibb(n - 2);
	}
}

int main()
{
	int n;
	std::cin >> n;

	for(int i = 0; i < n; i++)
	{
		int f;
		std::cin >> f;
		std::cout << fibb(f) << std::endl;
	}

	return 0;
}