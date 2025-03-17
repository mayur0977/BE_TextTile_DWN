# Problem statement for a web application

The document defines a common coding problem for a web application to write Unit test cases.

## Product Management

Create a boilerplate setup for React.Js, Angular, and Node.Js. The application should provide following features

1. User Authentication

   - As a user I should be able to login to the application
   - There should be a thirdparty authentication integrated e.g KeyCloak, OAuth, or Azure AD
   - All the pages exept landing page(if any) should be secured
   - Allow user to Add, update or delete a product if his role is [Admin]
   -

2. Header

   - Application Logo and Name
   - Menu option for Products to navigate to product list page
   - Login/Logout button based on authentication status
   - Cart button to view items added to cart

3. Manage Products:

   Properties

   - Product: `{productId:string, productName:string, productDescription:string, category:number, price:number, stockQuantity:number, featured:boolean}`
   - Categories: `{categoryId:number, categoryName:string}`

   Produt list

   - As a user, I should be able to see list of products added in the system.
   - I should be able to search and filter by category over products.
   - There should be actions available to View details.
   - There should be an action available to Delete a product. [role:Admin]
   - There should be an action available to Edit a product. [role:Admin]
   - There should a button to add new product. [role:Admin]

   Product Detail

   - As a user I should be able to see product detail page.
   - Button to add product to cart if the quantity is available.

   Product Form[role:Admin]

   - As a user I should be able to navigate to the product form page using add new product or edit product button from the Product list page.
   - For Add option, the form should be empty by default.
   - For Edit option, the form should be prefilled with data for which it is opened in edit mode.

   There should be field level validations as follows

   - All the products should have a unique aplhanumeric id.
   - All the products' name can be minumum of 3 and maximum of 20 characters, and it should support alphabets only.
   - All the products' description can be minumum of 3 and maximum of 250 characters, and it should supports any value.
   - Category should be from the following

     ` [
    {categoryId:1, categoryName:'electronic'},
    {categoryId:2, categoryName:'grocery'},
    {categoryId:3, categoryName:'clothes'}
 ]
`

4. Manage Cart:

   Properties

   - Cart:`{cartId:number, productId:number, productName:string, orderQuantity:number, stockQuantity:number}`

   Add to Cart:
   - As a user, I should be able to add a product to cart from it's detail page.
   - The product should be added to cart if it is in stock.
   - Adding product to cart should increase cart-item-count on header.

   Manage Cart:
   - As a user, I should be able to see items added to cart in a drawer from right side when I click on the cart icon from the header.
   - As a user, I should be able to manage quantity of products. Allow user to add maximum of stock-quantity. Remove item from cart if the quantity is been reduced to 0.

5. Expectations:

   Node.Js
   - Write Node.Js code to create REST APIs for the above requirements.
   - Secure APIs with the mentioned authentication michanism.

   Frontend Framework (React.Js, Angular)
   - Write Typescript code to create user interface for the above requirements.
   - Secure screens with the mentioned authentication michanism.

5. Write Unit test cases for the above features for the components, services, utilities, and UI/Dom.
