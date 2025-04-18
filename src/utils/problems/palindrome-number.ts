import assert from "assert";
import { Problem } from "../types/problem";

const starterCodePalindromeNumber = `function isPalindrome(x) {
  // Write your code here
};`;

// checks if the user has the correct code
const handlerPalindromeNumber = (fn: any) => {
  try {
    const inputs = [121, -121, 10, 0, 1221];
    const answers = [true, false, false, true, true];

    for (let i = 0; i < inputs.length; i++) {
      const result = fn(inputs[i]);
      assert.strictEqual(result, answers[i]);
    }
    return true;
  } catch (error: any) {
    console.log("Palindrome Number handler function error");
    throw new Error(error);
  }
};

export const palindromeNumber: Problem = {
  id: "palindrome-number",
  title: "9. Palindrome Number",
  problemStatement: `<p class='mt-3'>
  Given an integer <code>x</code>, return <code>true</code> if <code>x</code> is a
  <em>palindrome</em>, and <code>false</code> otherwise.
</p>`,
  examples: [
    {
      id: 1,
      inputText: "x = 121",
      outputText: "true",
      explanation: "121 reads the same forward and backward, so it is a palindrome.",
    },
    {
      id: 2,
      inputText: "x = -121",
      outputText: "false",
      explanation: "-121 reads as 121- backward, so it is not a palindrome.",
    },
    {
      id: 3,
      inputText: "x = 10",
      outputText: "false",
      explanation: "10 reads as 01 backward, so it is not a palindrome.",
    },
  ],
  constraints: `<li class='mt-2'>
  <code>-2<sup>31</sup> ≤ x ≤ 2<sup>31</sup> - 1</code>
</li>`,
  handlerFunction: handlerPalindromeNumber,
  starterCode: starterCodePalindromeNumber,
  order: 2,
  starterFunctionName: "function isPalindrome(",
};
