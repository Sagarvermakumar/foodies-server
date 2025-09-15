import axios from "axios";

export const getAddressFromPincode = async (pinCode) => {
  try {
    const response = await axios.get(
      `https://api.postalpincode.in/pincode/${pinCode}`
    );

    if (
      response.data &&
      response.data[0].Status === "Success" &&
      response.data[0].PostOffice &&
      response.data[0].PostOffice.length > 0
    ) {
      const postOffice = response.data[0].PostOffice[0];
      return {
        city: postOffice.Block || postOffice.Taluk || "", // Local City/Taluk
        district: postOffice.District || "",
        state: postOffice.State || "",
        country: "India",
        pinCode,
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching pincode details:", error.message);
    return null;
  }
};
