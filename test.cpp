#include <fstream>
#include <iostream>
#include <string>
using namespace std;

int main(int argc, char** argv)
{
	if (argc != 3)
	{
		cerr << "Usage: test [file_to_test] [expected_output_file]" << endl;
		cerr << "\tTests two files for containing the same lines of test data." << endl;
		return 0;
	}
	else
	{
		ifstream testFile(argv[1]);
		ifstream expectedFile(argv[2]);

		if (!testFile)
		{
			cerr << "Could not open test file " << argv[1] << endl;
			return 0;
		}

		if (!expectedFile)
		{
			cerr << "Could not open expected file " << argv[2] << endl;
			return 0;
		}

		string expectedLine, testLine;
		while(!expectedFile.eof())
		{
			getline(expectedFile, expectedLine);
			if (expectedLine == string(""))
			{
				break;
			}

			if (testFile.eof())
			{
				cout << "WA" << endl << "Test file ended prematurely" << endl;
				return 0;
			}

			getline(testFile, testLine);
			if (!(testLine == expectedLine))
			{
				cout << "WA" << endl;
				cout << "Expected: " << expectedLine << endl;
				cout << "Observed: " << testLine << endl;
				return 0;
			}
		}

		while (!testFile.eof())
		{
			getline(testFile, testLine);
			if (!(testLine == string("")))
			{
				cout << "WA" << endl;
				cout << "Testfile had additional line of input: " << endl;
				cout << testLine << endl;
				return 0;
			}
		}

		cout << "AC" << endl;

		testFile.close();
		expectedFile.close();
	}
}