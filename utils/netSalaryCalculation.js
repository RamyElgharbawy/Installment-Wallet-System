exports.calculateNetSalary = (user) => {
  // Calculate deductions
  const itemDeductions = user.items.reduce(
    (sum, item) => sum + item.monthlyAmount,
    0
  );
  const fellowsDeductions = user.fellows.reduce((sum, f) => sum + f.amount, 0);
  const spendingDeductions = user.spending.reduce(
    (sum, s) => sum + s.amount,
    0
  );
  const totalDeductions =
    itemDeductions + fellowsDeductions + spendingDeductions;

  // net salary
  const netSalary = parseFloat((user.salary - totalDeductions).toFixed(2));

  return netSalary;
};
