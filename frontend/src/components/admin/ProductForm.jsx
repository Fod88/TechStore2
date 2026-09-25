import { useEffect, useMemo, useRef, useState } from 'react';
import { ImagePlus, X } from 'lucide-react';
import Button from '../ui/Button';
import { Input, Select, Textarea } from '../ui/Field';
import ProductImage from '../ui/ProductImage';

const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB — comfortably under Cloudinary's free-tier limits

// Rendered inside a <Modal>; the submit button lives in the modal footer and targets this form by id.
// onSubmit(fields, imageFile) — imageFile is a File when the admin picked one, otherwise null.
export default function ProductForm({ id = 'product-form', initial, categories, onSubmit }) {
  const [values, setValues] = useState({
    name: initial?.name ?? '',
    description: initial?.description ?? '',
    price: initial?.price != null ? String(initial.price) : '',
    stock: initial?.stock != null ? String(initial.stock) : '',
    categoryId: initial?.categoryId ?? '',
  });
  const [errors, setErrors] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null); // object URL for the picked file
  const fileInputRef = useRef(null);

  // Release the object URL whenever it's replaced or the form closes, so it doesn't leak memory.
  useEffect(() => () => imagePreview && URL.revokeObjectURL(imagePreview), [imagePreview]);

  // GET /categories only returns active categories. If this product's category has since been
  // deactivated it won't be listed, so add it back as "current" to keep the form valid.
  const options = useMemo(() => {
    const list = categories.filter((c) => c.isActive);
    const missing = initial?.categoryId && !list.some((c) => c.id === initial.categoryId);
    return missing ? [...list, { id: initial.categoryId, name: 'Current category (inactive)', isActive: false }] : list;
  }, [categories, initial]);

  const setField = (field) => (event) => {
    setValues((v) => ({ ...v, [field]: event.target.value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const pickFile = (file) => {
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setErrors((e) => ({ ...e, image: 'Use a JPG, PNG or WEBP image.' }));
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setErrors((e) => ({ ...e, image: 'Keep the image under 5 MB.' }));
      return;
    }
    setErrors((e) => ({ ...e, image: undefined }));
    setImagePreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    setImageFile(file);
  };

  const clearFile = () => {
    setImagePreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const validate = () => {
    const next = {};
    if (values.name.trim().length < 2) next.name = 'Enter a product name.';
    if (!values.description.trim()) next.description = 'Enter a description.';
    else if (values.description.trim().length > 500) next.description = 'Keep the description under 500 characters.';
    if (values.price === '' || Number(values.price) < 0 || Number.isNaN(Number(values.price))) next.price = 'Enter a valid price.';
    if (values.stock === '' || !Number.isInteger(Number(values.stock)) || Number(values.stock) < 0) next.stock = 'Enter a whole number, 0 or more.';
    if (!values.categoryId) next.categoryId = 'Choose a category.';
    setErrors((e) => ({ ...next, image: e.image }));
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validate()) return;
    onSubmit(
      {
        name: values.name.trim(),
        description: values.description.trim(),
        price: Number(values.price),
        stock: Number(values.stock),
        categoryId: values.categoryId,
      },
      imageFile
    );
  };

  const displayImage = imagePreview ?? initial?.image ?? '';

  return (
    <form id={id} className="form" onSubmit={handleSubmit} noValidate>
      <Input label="Name" value={values.name} onChange={setField('name')} error={errors.name} autoFocus />
      <Textarea
        label="Description"
        rows={4}
        maxLength={500}
        value={values.description}
        onChange={setField('description')}
        error={errors.description}
        hint={`${values.description.length}/500`}
      />
      <div className="form__row">
        <Input label="Price" type="number" min="0" step="0.01" inputMode="decimal" value={values.price} onChange={setField('price')} error={errors.price} />
        <Input label="Stock" type="number" min="0" step="1" inputMode="numeric" value={values.stock} onChange={setField('stock')} error={errors.stock} />
      </div>
      <Select label="Category" value={values.categoryId} onChange={setField('categoryId')} error={errors.categoryId}>
        <option value="">Select a category</option>
        {options.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
            {c.isActive ? '' : ' (inactive)'}
          </option>
        ))}
      </Select>

      <div className="field">
        <div className="field__head">
          <label htmlFor={`${id}-image`}>Product image (optional)</label>
        </div>
        <div className="image-upload">
          <div className="image-upload__preview">{displayImage ? <ProductImage src={displayImage} alt="Product preview" /> : <span>No image</span>}</div>
          <div className="image-upload__body">
            <input
              ref={fileInputRef}
              id={`${id}-image`}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={(e) => pickFile(e.target.files?.[0])}
            />
            <div className="image-upload__actions">
              <Button type="button" variant="secondary" size="sm" icon={ImagePlus} onClick={() => fileInputRef.current?.click()}>
                {displayImage ? 'Replace image' : 'Upload image'}
              </Button>
              {imageFile && (
                <Button type="button" variant="ghost" size="sm" icon={X} onClick={clearFile}>
                  Cancel
                </Button>
              )}
            </div>
            <p className="field__hint">JPG, PNG or WEBP, up to 5 MB.</p>
            {errors.image && <p className="field__error">{errors.image}</p>}
          </div>
        </div>
      </div>
    </form>
  );
}
