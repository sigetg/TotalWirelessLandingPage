import React from 'react';
import { useForm } from 'react-hook-form';
import { Search, MapPin, Calendar } from 'lucide-react';
import { SearchFormData } from '../types';

interface SearchFormProps {
  onSearch: (data: SearchFormData) => void;
  isLoading?: boolean;
}

const SearchForm: React.FC<SearchFormProps> = ({ onSearch, isLoading = false }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SearchFormData>({
    defaultValues: {
      radius: 50,
    },
  });

  const watchedValues = watch();

  const onSubmit = (data: SearchFormData) => {
    // Check if at least one location field is filled
    const hasLocationData = data.address || data.zip || (data.city && data.state);
    
    if (!hasLocationData) {
      alert('Please enter at least one location field (address, zip code, or city and state)');
      return;
    }
    
    onSearch(data);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Address Input */}
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
              Full Address
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                {...register('address')}
                type="text"
                id="address"
                placeholder="Enter your full address"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
              />
            </div>
          </div>

          {/* Zip Code Input */}
          <div>
            <label htmlFor="zip" className="block text-sm font-medium text-gray-700 mb-1">
              Zip Code
            </label>
            <input
              {...register('zip')}
              type="text"
              id="zip"
              placeholder="Enter zip code"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
            />
          </div>

          {/* City Input */}
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <input
              {...register('city')}
              type="text"
              id="city"
              placeholder="Enter city name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
            />
          </div>

          {/* State Input */}
          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
              State
            </label>
            <select
              {...register('state')}
              id="state"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
            >
              <option value="">Select State</option>
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

        {/* Radius Input */}
        <div>
          <label htmlFor="radius" className="block text-sm font-medium text-gray-700 mb-1">
            Search Radius (miles)
          </label>
          <input
            {...register('radius', { min: 1, max: 100 })}
            type="number"
            id="radius"
            min="1"
            max="100"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
          />
          {errors.radius && (
            <p className="text-red-500 text-sm mt-1">Radius must be between 1 and 100 miles</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !(watchedValues.address || watchedValues.zip || (watchedValues.city && watchedValues.state))}
          className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Searching...</span>
            </>
          ) : (
            <>
              <Search className="h-5 w-5" />
              <span>Find Events</span>
            </>
          )}
        </button>
      </form>

      <div className="mt-4 text-center">
        <p className="text-sm text-gray-500">
          Enter any combination of address, zip code, or city and state
        </p>
      </div>
    </div>
  );
};

export default SearchForm; 