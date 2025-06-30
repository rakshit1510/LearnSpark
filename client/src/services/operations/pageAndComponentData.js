import { apiConnector } from '../apiConnector'
import { catalogData } from '../apis'
// import { toast } from "react-hot-toast"

// ================ Get Catalog Page Data ================
export const getCatalogPageData = async (categoryId) => {
  let result = null;

  try {
    const response = await apiConnector(
      "POST",
      catalogData.CATALOGPAGEDATA_API,
      { categoryId }
    );

    console.log("CATALOG PAGE DATA API RESPONSE............", response);

    if (response?.data?.statusCode !== 200) {
      throw new Error(response.data.message || "Could not fetch catalog data");
    }

    result = response.data.data;
  } catch (error) {
    console.error("CATALOG PAGE DATA API ERROR:", error);
    result = null;
  }

  return result;
};

