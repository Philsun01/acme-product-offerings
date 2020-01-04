const root = document.querySelector("#root");
const companiesURL = "https://acme-users-api-rev.herokuapp.com/api/companies";
const offeringsURL = "https://acme-users-api-rev.herokuapp.com/api/offerings";
const productsURL = "https://acme-users-api-rev.herokuapp.com/api/products";

let productList = ''; // declaring global variable to be accessed by eventListener

window.addEventListener('hashchange',() => {
    render(productList, location.hash.slice(1));
    console.log(location.hash.slice(1))
});

const loadData = async() => {

    const results = await Promise.all(
        [
            fetch(productsURL), 
            fetch(companiesURL), 
            fetch(offeringsURL)
        ])
     
    const [products, companies, offerings] = await Promise.all(results.map( prom => prom.json()));
    
    productList = compileData(products, companies, offerings);

    render(productList);
}

const compileData = (products, companies, offerings ) => {

    const matchCompany = (id)=> {
        return companies.find( company => company.id === id).name;
    }

    const productList = products.map( product => {
        return {
            name: product.name,
            id: product.id,
            suggestedPrice: product.suggestedPrice,
            description: product.description,
            offers: offerings.filter( offer => {
                    return offer.productId === product.id
                } ).map(offer => { 
                        return { price: offer.price, company: matchCompany(offer.companyId) }
                    })
        }
    })
    return productList;
}

const render = (productList, id) => {
    if(id){
        const product = productList.find( prod => prod.id === id);
        root.innerHTML = `<div class = 'card'>
                <h3><a href = '#'>${product.name}</a></h3>
                <p>${product.description}</p>
                <p>Suggested Price $${product.suggestedPrice}</p>
                <ul>
                    ${product.offers.map(offer=>{
                        return `<li>$${offer.price} offered by ${offer.company}</li>`
                    }).join('')}
                </ul>
                    </div>`;
    } else {
        root.innerHTML = 
        productList.map( product => {
            return `<div class = 'card'>
                <h3><a href = '#${product.id}'>${product.name}</a></h3>
                <p>${product.description}</p>
                <p>Suggested Price $${product.suggestedPrice}</p>
                <ul>
                    ${product.offers.map(offer=>{
                        return `<li>$${offer.price} offered by ${offer.company}</li>`
                    }).join('')}
                </ul>
                    </div>`;
        }).join('');
    }
    
}

loadData();