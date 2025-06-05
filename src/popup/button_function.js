const buttons = document.querySelectorAll(".order .order-btn");

buttons.forEach(btn => {
  btn.addEventListener("click", () => {
    buttons.forEach(b => b.classList.remove("selected")); // 全部外す
    btn.classList.add("selected"); // 押されたやつだけ selected
    console.log("選択されたボタンID:", btn.id);
  });
});
