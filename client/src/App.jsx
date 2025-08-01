import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const App = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [refresh, setRefresh] = useState(false);

  function handleFileChange(e) {
    setSelectedFile(e.target.files[0]);
  }

  async function uploadFile() {
    if (!selectedFile) {
      toast.error("Select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      await axios.post("/api/files/upload", formData);

      setSelectedFile(null);
      setRefresh(!refresh);
      toast.success("File uploaded!");
    } catch (error) {
      console.error(error);
      toast.error("Upload failed.");
    }
  }

  async function fetchFiles() {
    try {
      const res = await axios.get("/api/files/");

      console.log("Fetched files:", res.data.files);
      setUploadedFiles(res.data.files);
    } catch (error) {
      console.error(error);
    }
  }

  async function getSignedUrl(id, action) {
    try {
      const res = await axios.get(
        `/api/files/signed-url/${id}?action=${action}`
      );

      if (action === "view") {
        window.open(res.data.signedUrl, "_blank");
      } else {
        const a = document.createElement("a");
        a.href = res.data.signedUrl;
        a.download = res.data.fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        toast.success("File downloaded!");
      }
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    fetchFiles();
  }, [refresh]);

  return (
    <div className="flex flex-col items-center h-dvh p-5 w-screen overflow-hidden">
      <h1 className="font-bold text-2xl text-center">Supabase File Upload</h1>

      <div className="flex flex-col items-center w-full p-2 mt-4">
        <input
          type="file"
          onChange={handleFileChange}
          className="bg-gray-700 text-white border border-black rounded-lg sm:text-xl"
        />
        <button
          onClick={uploadFile}
          className="mt-2 w-[35%] bg-gray-900 text-white py-2 rounded-lg hover:bg-gray-800 sm:w-[30%] lg:w-[20%]"
        >
          Upload
        </button>
      </div>

      {!uploadedFiles || uploadedFiles.length === 0 ? (
        <div className="text-center bg-gray-800 p-5 text-white">
          No files yet...
        </div>
      ) : (
        <div className="flex flex-col items-center w-[90%] sm:w-[70%] lg:w-[60%] text-center flex-1 h-full overflow-y-auto rounded-xl mt-2">
          <h2 className="text-xl font-semibold bg-gray-800 text-white w-full p-1 sm:text-2xl">
            Files:{" "}
          </h2>
          <ul className="bg-gray-700 w-full p-4 text-white rounded-b-xl">
            {uploadedFiles.map((file) => (
              <li key={file._id} className="flex flex-col py-4">
                <span className="text-lg lg:text-xl">{file.fileName}</span>
                <div className="flex justify-center gap-1 pt-4 sm:text-lg">
                  <button
                    onClick={() => getSignedUrl(file._id, "view")}
                    className="bg-blue-700 px-5 py-1 rounded-lg"
                  >
                    View
                  </button>
                  <button
                    onClick={() => getSignedUrl(file._id, "download")}
                    className="bg-black px-5 py-1 rounded-lg"
                  >
                    Download
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default App;
