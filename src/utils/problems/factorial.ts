import assert from "assert";
import { Problem } from "../types/problem";

// Starter code shown to the user
const starterCodeFactorial = `function factorial(n){
  // Write your code here
};`;

// Handler function to test user's solution
const handlerFactorial = (fn: any) => {
  try {
    const inputs = [0, 1, 3, 5, 7];
    const expectedOutputs = [1, 1, 6, 120, 5040];

    for (let i = 0; i < inputs.length; i++) {
      const result = fn(inputs[i]);
      assert.strictEqual(result, expectedOutputs[i]);
    }

    return true;
  } catch (error: any) {
    console.log("factorial handler function error");
    throw new Error(error);
  }
};

// Problem object definition
export const factorial: Problem = {
  id: "factorial",
  title: "Factorial",
  problemStatement: `<p class='mt-3'>
    Given a non-negative integer <code>n</code>, return the factorial of <code>n</code>.
  </p>
  <p class='mt-3'>
    The factorial of <code>n</code> is the product of all positive integers less than or equal to <code>n</code>. 
    The factorial of 0 is defined as 1.
  </p>`,
  examples: [
    {
      id: 1,
      inputText: "n = 0",
      outputText: "1",
      explanation: "The factorial of 0 is 1 by definition.",
    },
    {
      id: 2,
      inputText: "n = 3",
      outputText: "6",
      explanation: "3! = 3 × 2 × 1 = 6",
    },
    {
      id: 3,
      inputText: "n = 5",
      outputText: "120",
      explanation: "5! = 5 × 4 × 3 × 2 × 1 = 120",
    },
  ],
  constraints: `<li class='mt-2'>
    <code>0 ≤ n ≤ 10</code>
  </li>`,
  handlerFunction: handlerFactorial,
  starterCode: starterCodeFactorial,
  order: 2,
  starterFunctionName: "function factorial(",
};
