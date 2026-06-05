<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreOrderRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        return [
            'type' => 'required|in:dine-in,takeaway,delivery',
            'delivery_address' => 'required_if:type,delivery|nullable|string',
            'delivery_phone' => 'required_if:type,delivery|number|max:11|min:11',
            'table_number' => 'required_if:type,dine-in|nullable|string',
            'notes' => 'nullable|string|max:1000',
        ];
    }
}
