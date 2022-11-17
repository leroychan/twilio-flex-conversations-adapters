let { hehe, haha } = test();
if (!hehe) {
  console.log("a");
}
haha = "asdasdas";
console.log(hehe);
console.log(haha);
function test() {
  return false;
  //   return {
  //     hehe: "a",
  //     haha: "world",
  //   };
}
