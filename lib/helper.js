// // other user
export const otherUser = (members, userId) => {
//   console.log("All members:", members.map(m => m._id.toString()));
//   console.log("Current userId:", userId.toString());

  const result = members?.find(
    (member) => member._id.toString() !== userId?.toString()
  );

//   console.log("Other user found:", result);
  return result;
};
