export const response = {
    get_success: (res, data = {}, message = 'Success') => {
        return res.status(200).json({ success: true, message, data });
    },
    created_success: (res, data = {}, message = 'Created') => {
        return res.status(201).json({ success: true, message, data });
    },
    deleted_success: (res, message = 'Deleted') => {
        return res.status(200).json({ success: true, message });
    },
    updated_success: (res, data = {}, message = 'Updated') => {
        return res.status(200).json({ success: true, message, data });
    },
    success: (res, data = {}, message = 'Success') => {
        return res.status(200).json({ success: true, message, data });
    },
    error: (res, message = 'Error', data = null) => {
        return res.status(400).json({ success: false, message, data });
    },
    notFound: (res, message = 'Not Found') => {
        return res.status(404).json({ success: false, message });
    },
    serverError: (res, message = 'Internal Server Error') => {
        return res.status(500).json({ success: false, message });
    }
}