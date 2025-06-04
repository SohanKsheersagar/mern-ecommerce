import React, { useState, useEffect } from 'react';
import { Row, Col } from 'reactstrap';
import Input from '../../Common/Input';
import Switch from '../../Common/Switch';
import Button from '../../Common/Button';
import SelectOption from '../../Common/SelectOption';

const ROLES = {
  Admin: 'admin',
  Merchant: 'merchant'
};

const taxableSelect = [
  { value: 1, label: 'Yes' },
  { value: 0, label: 'No' }
];

const AddProduct = () => {
  const [user] = useState({ role: ROLES.Admin });
  const [brands, setBrands] = useState([]);
  const [image, setImage] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [productFormData, setProductFormData] = useState({
    sku: '',
    name: '',
    description: '',
    quantity: 0,
    price: 0,
    taxable: 1,
    brand: '',
    isActive: true
  });

  useEffect(() => {
    // Fetch or mock brand options
    setBrands([
      { label: 'Select Brand', value: '' },
      { label: 'Apple', value: 'apple' },
      { label: 'Samsung', value: 'samsung' }
    ]);
  }, []);

  const productChange = (name, value) => {
    setProductFormData(prev => ({ ...prev, [name]: value }));
  };

  const addProduct = () => {
    console.log('Submitting product:', productFormData);
    alert('Product added! Check console for data.');
  };

  const handleSubmit = e => {
    e.preventDefault();
    addProduct();
  };

  return (
    <div className='add-product'>
      <form onSubmit={handleSubmit} noValidate>
        <Row>
          <Col xs='12' lg='6'>
            <Input
              type='text'
              error={formErrors.sku}
              label='Sku'
              name='sku'
              placeholder='Product Sku'
              value={productFormData.sku}
              onInputChange={productChange}
            />
          </Col>
          <Col xs='12' lg='6'>
            <Input
              type='text'
              error={formErrors.name}
              label='Name'
              name='name'
              placeholder='Product Name'
              value={productFormData.name}
              onInputChange={productChange}
            />
          </Col>
          <Col xs='12' md='12'>
            <Input
              type='textarea'
              error={formErrors.description}
              label='Description'
              name='description'
              placeholder='Product Description'
              value={productFormData.description}
              onInputChange={productChange}
            />
          </Col>
          <Col xs='12' lg='6'>
            <Input
              type='number'
              error={formErrors.quantity}
              label='Quantity'
              name='quantity'
              placeholder='Product Quantity'
              value={productFormData.quantity}
              onInputChange={productChange}
            />
          </Col>
          <Col xs='12' lg='6'>
            <Input
              type='number'
              error={formErrors.price}
              label='Price'
              name='price'
              placeholder='Product Price'
              value={productFormData.price}
              onInputChange={productChange}
            />
          </Col>
          <Col xs='12' md='12'>
            <SelectOption
              error={formErrors.taxable}
              label='Taxable'
              name='taxable'
              options={taxableSelect}
              value={productFormData.taxable}
              handleSelectChange={value => productChange('taxable', value)}
            />
          </Col>
          <Col xs='12' md='12'>
            <SelectOption
              error={formErrors.brand}
              name='brand'
              label='Select Brand'
              value={productFormData.brand}
              options={brands}
              handleSelectChange={value => productChange('brand', value)}
            />
          </Col>
          <Col xs='12' md='12'>
            <Input
              type='file'
              error={formErrors.file}
              name='image'
              label='Upload Image'
              value={image}
              onInputChange={(name, value) => setImage(value)}
            />
          </Col>
          <Col xs='12' md='12' className='my-2'>
            <Switch
              id='active-product'
              name='isActive'
              label='Active?'
              checked={productFormData.isActive}
              toggleCheckboxChange={value => productChange('isActive', value)}
            />
          </Col>
        </Row>
        <hr />
        <div className='add-product-actions'>
          <Button type='submit' text='Add Product' />
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
