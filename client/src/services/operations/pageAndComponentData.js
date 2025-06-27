import { apiConnector } from '../apiConnector'
import { catalogData } from '../apis'
// import { toast } from "react-hot-toast"

// ================ Get Catalog Page Data ================
export const getCatalogPageData = async (categoryId) => {
  // const toastId = toast.loading("Loading...")
  let result = []

  try {
    const response = await apiConnector(
      "POST",
      catalogData.CATALOGPAGEDATA_API,
      { categoryId: categoryId }
    )

    console.log("CATALOG PAGE DATA API RESPONSE............", response)

    if (response.data.statusCode !== 200) {
      throw new Error(response.data.message)
    }

    result = response.data.data
  } catch (error) {
    console.log("CATALOG PAGE DATA API ERROR....", error)
    // toast.error(error?.response?.data?.message || "Could not fetch catalog data")
    result = error?.response?.data?.data || []
  }

  // toast.dismiss(toastId)
  return result
}
