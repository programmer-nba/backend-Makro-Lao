const axios = require("axios");

const getProducts = async (req, res) => {
    try {
        const [response, response2] = await Promise.all([
            axios.post(`${process.env.PRODUCTS_URL}/api_product`, null, {
                headers: {
                    "auth-token": process.env.PRODUCTS_TOKEN
                }
            }), 
            axios.post(`${process.env.PRODUCTS_URL}/api_product/category`, null, {
                headers: {
                    "auth-token": process.env.PRODUCTS_TOKEN
                }
            })
        ])

        const items = response.data
        const categories = response2.data?.data

        const products = items?.map((item) => {
            const category = categories?.find(c => c._id === item.product_category)
            return {
                ...item,
                category_name: category?.name
            }
        })

        return res.status(200).json(products)
    } catch (err) {
        console.log(err)
        return res.status(500).json(err.message)
    }
}

const getCategories = async (req, res) => {
    try {
        const response = await axios.post(`${process.env.PRODUCTS_URL}/api_product/category`, null, {
            headers: {
                "auth-token": process.env.PRODUCTS_TOKEN
            }
        });
        const categories = response.data?.data
        return res.status(200).json(categories)
    } catch (err) {
        console.log(err)
        return res.status(500).json(err.message)
    }
}

module.exports = { getProducts, getCategories }