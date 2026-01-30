export function LoadsExplanation() {
  return (
    <div className="w-full mx-auto grid gap-4 custom-container">
      <h2 className="text-3xl small-caps font-medium mb-3 border-b-2 pb-1 border-gray-400">
        Load Calculation and Balancing Approach
      </h2>
      <p>
        Instead of balancing only by ARR, I have calculated for each account a weighted composite
        score, to capture complexity beyond just revenue.
      </p>
      <code className="bg-gray-800 px-2 py-3">
        Account_Weight = (ARR_normalized × w1) + (Employees_normalized × w2) + (Marketers_normalized
        × w3) + (Risk_normalized × w4) + (Location_penalty × w5)
      </code>

      <p>We can then use this weighted score to balance load across reps.</p>
      <p>
        The selection of the weights (w1, w2, w3, w4, w5) could be based on business priorities and
        historical performance data. <br />
        These weights are adjustable and can be iterated on, but I think values should ultimately be
        defined through strategic discussions aligned with company priorities.
      </p>

      <p>For this example I have used:</p>
      <code className="bg-gray-800 px-2 py-3">
        <ul className="flex flex-col">
          <li className="flex gap-2">
            <span className="w-24">ARR:</span> <span>w1 = 0.45</span>
          </li>
          <li className="flex gap-2">
            <span className="w-24">Employees:</span> <span>w2 = 0.2</span>
          </li>
          <li className="flex gap-2">
            <span className="w-24">Marketers:</span> <span>w3 = 0.1</span>
          </li>
          <li className="flex gap-2">
            <span className="w-24">Risk:</span> <span>w4 = 0.2</span>
          </li>
          <li className="flex gap-2">
            <span className="w-24">Location:</span> <span>w5 = 0.05</span>
          </li>
        </ul>
      </code>

      <p>
        All factors are normalized to 0-1 scale before weighting (min-max normalization).
        <br />
        Then a greedy assignment algorithm assigns accounts (sorted by load) to the rep with the
        lowest current total load, ensuring balanced distribution across the team.
      </p>

      <code className="bg-gray-800 px-2 py-3">
        For each segment (Enterprise, Mid-Market):
        <ul className="ml-6">
          <li>1. Sort accounts by weight (descending)</li>
          <li>2. Sort reps by current total weight (ascending)</li>
          <li>3. Assign next heaviest account to lightest-loaded rep</li>
          <li>4. Repeat until all accounts assigned</li>
        </ul>
      </code>

      <div className="flex flex-col gap-3 mt-6">
        <h2 className="text-xl font-semibold underline underline-offset-4">
          Note on Segment Optimization
        </h2>
        <p>
          The assignment algorithm balances territories independently within each segment
          (Enterprise and Mid-Market). <br />
          When the employee threshold is set very low or very high, one segment can receive
          significantly more (or fewer) accounts than the other, leading to noticeable imbalances
          across segments.
        </p>
        <p>
          The charts and summary table will help you spot these situations to adjust the threshold.
        </p>
      </div>
    </div>
  )
}
