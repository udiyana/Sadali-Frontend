<?php

namespace App\Models;

use Illuminate\Database\Eloquent\SoftDeletes;

class Property extends CompanyRecord
{
    use SoftDeletes;
}
