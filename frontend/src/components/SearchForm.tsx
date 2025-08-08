import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Search, MapPin, Calendar } from 'lucide-react';
import { SearchFormData } from '../types';

interface SearchFormProps {
  onSearch: (data: SearchFormData) => void;
  isLoading?: boolean;
  lang: 'en' | 'es';
  translations: any;
  userLocation?: { lat: number; lon: number } | null;
}

type SearchMethod = 'zip' | 'address' | 'cityState';

const SearchForm: React.FC<SearchFormProps> = ({ onSearch, isLoading = false, lang, translations, userLocation }) => {
  const [activeTab, setActiveTab] = useState<SearchMethod>('zip');
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<SearchFormData>();

  const watchedValues = watch();

  const handleTabChange = (tab: SearchMethod) => {
    setActiveTab(tab);
    // Reset form when changing tabs
    reset();
  };

  const onSubmit = (data: SearchFormData) => {
    let hasValidData = false;
    
    switch (activeTab) {
      case 'zip':
        hasValidData = !!data.zip;
        break;
      case 'address':
        hasValidData = !!(data.address && data.city && data.state);
        break;
      case 'cityState':
        hasValidData = !!(data.city && data.state);
        break;
    }
    
    if (!hasValidData) {
      const errorMessage = activeTab === 'zip' 
        ? (lang === 'es' ? 'Por favor ingrese un código postal' : 'Please enter a zip code')
        : activeTab === 'address'
        ? (lang === 'es' ? 'Por favor complete todos los campos de dirección' : 'Please complete all address fields')
        : (lang === 'es' ? 'Por favor ingrese ciudad y estado' : 'Please enter city and state');
      alert(errorMessage);
      return;
    }
    
    onSearch(data);
  };

  const isSubmitDisabled = () => {
    switch (activeTab) {
      case 'zip':
        return !watchedValues.zip;
      case 'address':
        return !(watchedValues.address && watchedValues.city && watchedValues.state);
      case 'cityState':
        return !(watchedValues.city && watchedValues.state);
      default:
        return true;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        <button
          type="button"
          onClick={() => handleTabChange('zip')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'zip'
              ? 'bg-white text-red-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}

        >
          {lang === 'es' ? 'Código Postal' : 'Zip Code'}
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('address')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'address'
              ? 'bg-white text-red-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}

        >
          {lang === 'es' ? 'Dirección Completa' : 'Full Address'}
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('cityState')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'cityState'
              ? 'bg-white text-red-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}

        >
          {lang === 'es' ? 'Ciudad y Estado' : 'City & State'}
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Zip Code Tab */}
        {activeTab === 'zip' && (
          <div>
            <label htmlFor="zip" className="block text-sm font-medium text-gray-700 mb-1" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
              {lang === 'es' ? 'Código postal' : 'Zip Code'}
            </label>
            <input
              {...register('zip')}
              type="text"
              id="zip"
              placeholder={lang === 'es' ? 'Ingrese el código postal' : 'Enter zip code'}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
    
            />
          </div>
        )}

        {/* Full Address Tab */}
        {activeTab === 'address' && (
          <div className="space-y-4">
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                {lang === 'es' ? 'Dirección completa' : 'Full Address'}
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  {...register('address')}
                  type="text"
                  id="address"
                  placeholder={lang === 'es' ? 'Ingrese su dirección completa' : 'Enter your full address'}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
        
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                  {lang === 'es' ? 'Ciudad' : 'City'}
                </label>
                <input
                  {...register('city')}
                  type="text"
                  id="city"
                  placeholder={lang === 'es' ? 'Ingrese el nombre de la ciudad' : 'Enter city name'}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
        
                />
              </div>
              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                  {lang === 'es' ? 'Estado' : 'State'}
                </label>
                <select
                  {...register('state')}
                  id="state"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
        
                >
                  <option value="">{lang === 'es' ? 'Seleccione estado' : 'Select State'}</option>
                  <option value="AL">Alabama</option>
                  <option value="AK">Alaska</option>
                  <option value="AZ">Arizona</option>
                  <option value="AR">Arkansas</option>
                  <option value="CA">California</option>
                  <option value="CO">Colorado</option>
                  <option value="CT">Connecticut</option>
                  <option value="DE">Delaware</option>
                  <option value="FL">Florida</option>
                  <option value="GA">Georgia</option>
                  <option value="HI">Hawaii</option>
                  <option value="ID">Idaho</option>
                  <option value="IL">Illinois</option>
                  <option value="IN">Indiana</option>
                  <option value="IA">Iowa</option>
                  <option value="KS">Kansas</option>
                  <option value="KY">Kentucky</option>
                  <option value="LA">Louisiana</option>
                  <option value="ME">Maine</option>
                  <option value="MD">Maryland</option>
                  <option value="MA">Massachusetts</option>
                  <option value="MI">Michigan</option>
                  <option value="MN">Minnesota</option>
                  <option value="MS">Mississippi</option>
                  <option value="MO">Missouri</option>
                  <option value="MT">Montana</option>
                  <option value="NE">Nebraska</option>
                  <option value="NV">Nevada</option>
                  <option value="NH">New Hampshire</option>
                  <option value="NJ">New Jersey</option>
                  <option value="NM">New Mexico</option>
                  <option value="NY">New York</option>
                  <option value="NC">North Carolina</option>
                  <option value="ND">North Dakota</option>
                  <option value="OH">Ohio</option>
                  <option value="OK">Oklahoma</option>
                  <option value="OR">Oregon</option>
                  <option value="PA">Pennsylvania</option>
                  <option value="RI">Rhode Island</option>
                  <option value="SC">South Carolina</option>
                  <option value="SD">South Dakota</option>
                  <option value="TN">Tennessee</option>
                  <option value="TX">Texas</option>
                  <option value="UT">Utah</option>
                  <option value="VT">Vermont</option>
                  <option value="VA">Virginia</option>
                  <option value="WA">Washington</option>
                  <option value="WV">West Virginia</option>
                  <option value="WI">Wisconsin</option>
                  <option value="WY">Wyoming</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* City & State Tab */}
        {activeTab === 'cityState' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                {lang === 'es' ? 'Ciudad' : 'City'}
              </label>
              <input
                {...register('city')}
                type="text"
                id="city"
                placeholder={lang === 'es' ? 'Ingrese el nombre de la ciudad' : 'Enter city name'}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
      
              />
            </div>
            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
                {lang === 'es' ? 'Estado' : 'State'}
              </label>
              <select
                {...register('state')}
                id="state"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
      
              >
                <option value="">{lang === 'es' ? 'Seleccione estado' : 'Select State'}</option>
                <option value="AL">Alabama</option>
                <option value="AK">Alaska</option>
                <option value="AZ">Arizona</option>
                <option value="AR">Arkansas</option>
                <option value="CA">California</option>
                <option value="CO">Colorado</option>
                <option value="CT">Connecticut</option>
                <option value="DE">Delaware</option>
                <option value="FL">Florida</option>
                <option value="GA">Georgia</option>
                <option value="HI">Hawaii</option>
                <option value="ID">Idaho</option>
                <option value="IL">Illinois</option>
                <option value="IN">Indiana</option>
                <option value="IA">Iowa</option>
                <option value="KS">Kansas</option>
                <option value="KY">Kentucky</option>
                <option value="LA">Louisiana</option>
                <option value="ME">Maine</option>
                <option value="MD">Maryland</option>
                <option value="MA">Massachusetts</option>
                <option value="MI">Michigan</option>
                <option value="MN">Minnesota</option>
                <option value="MS">Mississippi</option>
                <option value="MO">Missouri</option>
                <option value="MT">Montana</option>
                <option value="NE">Nebraska</option>
                <option value="NV">Nevada</option>
                <option value="NH">New Hampshire</option>
                <option value="NJ">New Jersey</option>
                <option value="NM">New Mexico</option>
                <option value="NY">New York</option>
                <option value="NC">North Carolina</option>
                <option value="ND">North Dakota</option>
                <option value="OH">Ohio</option>
                <option value="OK">Oklahoma</option>
                <option value="OR">Oregon</option>
                <option value="PA">Pennsylvania</option>
                <option value="RI">Rhode Island</option>
                <option value="SC">South Carolina</option>
                <option value="SD">South Dakota</option>
                <option value="TN">Tennessee</option>
                <option value="TX">Texas</option>
                <option value="UT">Utah</option>
                <option value="VT">Vermont</option>
                <option value="VA">Virginia</option>
                <option value="WA">Washington</option>
                <option value="WV">West Virginia</option>
                <option value="WI">Wisconsin</option>
                <option value="WY">Wyoming</option>
              </select>
            </div>
          </div>
        )}
        
        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || isSubmitDisabled()}
          className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-bold py-4 px-8 rounded-xl transition-colors duration-200 flex items-center justify-center space-x-2 text-lg shadow-lg"

        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              <span>{lang === 'es' ? 'Buscando...' : 'Searching...'}</span>
            </>
          ) : (
            <>
              <Search className="h-6 w-6" />
              <span>{lang === 'es' ? 'Buscar eventos' : 'Find Events'}</span>
            </>
          )}
        </button>
      </form>
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-500" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
          {activeTab === 'zip' 
            ? (lang === 'es' ? 'Ingrese su código postal para encontrar eventos cercanos' : 'Enter your zip code to find nearby events')
            : activeTab === 'address'
            ? (lang === 'es' ? 'Complete todos los campos de dirección para una búsqueda precisa' : 'Complete all address fields for precise search')
            : (lang === 'es' ? 'Seleccione ciudad y estado para buscar eventos' : 'Select city and state to search for events')
          }
        </p>
      </div>
    </div>
  );
};

export default SearchForm; 