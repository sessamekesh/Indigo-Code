import java.util.Scanner;


public class fib {

	public static long fibb(int n) {
		if (n < 2) {
			return 1;
		} else {
			long f1 = 1, f2 = 1, curr = 1 + 1;
			for (int i = 2; i < n; i++) {
				f2 = f1;
				f1 = curr;
				curr = f1 + f2;
			}
			return curr;
		}
	}
	
	public static void main(String[] args) {
		
		Scanner in = new Scanner(System.in);
		
		int nCases = in.nextInt();
		
		for (int i = 0; i < nCases; i++) {
			System.out.println(fibb(in.nextInt()));
		}
		
		in.close();

	}

}
