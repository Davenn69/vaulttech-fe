export const handleUpload = async () => {
  const input = document.createElement("input");
  input.type = "file";

  input.onchange = async (e) => {
    const file = e.target.files[0];

    const formData = new FormData();
    formData.append("file", file);

    // await fetch("http://localhost:5000/upload", {
    //   method: "POST",
    //   body: formData,
    // });

    return formData;
  };

  input.click();
};
