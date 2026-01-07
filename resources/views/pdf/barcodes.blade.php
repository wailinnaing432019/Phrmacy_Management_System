<!DOCTYPE html>
<html>

<head>
    <title>Barcodes</title>
    <style>
        body {
            font-family: sans-serif;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        td {
            width: 33%;
            /* 3 items per row */
            text-align: center;
            padding: 15px;
            vertical-align: top;
        }

        .barcode img {
            max-width: 100%;
            height: 40px;
        }

        .barcode {
            page-break-inside: avoid;
        }
    </style>
</head>

<body>
    <table>
        <tr>
            @for ($i = 0; $i < $medicinesData['qty']; $i++)
                <td>
                    <div class="barcode">
                        <img src="{{ $medicinesData['barcode_src'] }}" alt="{{ $medicinesData['name'] }}">
                        <span>{{ $medicinesData['barcode'] }}</span>
                    </div>
                </td>
                @if (($i + 1) % 3 == 0)
                    {{-- close row after 3 items --}}
        </tr>
        <tr>
            @endif
            @endfor
        </tr>
    </table>
</body>

</html>
