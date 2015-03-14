using System;

public class HelloWorld
{
    static public void Main ()
    {
    	int n;
    	if (int.TryParse(Console.ReadLine(), out n))
    	{
    		for (int i = 0; i < n; i++)
    		{
    			Console.WriteLine(42);
    		}
    	}
    }
}