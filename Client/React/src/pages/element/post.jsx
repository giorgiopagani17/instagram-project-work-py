import React, { useState, useEffect } from "react";
import { useSelector } from 'react-redux';

function UserImages() {
  const [images, setImages] = useState([]);
  const user = useSelector((state) => state.user.value);
  const id = user ? user.id : '';

  useEffect(() => {
    async function fetchUserImages() {
      try {
        const response = await fetch(`http://localhost:8000/user_post/${id}`);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const imageData = await response.json();
        setImages(imageData);
      } catch (error) {
        console.error("Error fetching user images:", error);
      }
    }

    fetchUserImages();
  }, [id]);

  return (
    <div>
      <h2>User Images</h2>
      <div>
        {images.map((imageUrl, index) => (
          <img key={index} src={imageUrl} alt={`Image ${index}`} />
        ))}
      </div>
    </div>
  );
}

export default UserImages;
