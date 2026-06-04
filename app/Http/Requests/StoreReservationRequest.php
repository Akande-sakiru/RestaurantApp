<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreReservationRequest extends FormRequest
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
            'reserved_date' => 'required|date|after_or_equal:today',
            'reserved_time' => 'required|date_format:H:i',
            'party_size' => 'required|integer|min:1|max:20',
            'special_requests' => 'nullable|string|max:500',
        ];
    }
}
