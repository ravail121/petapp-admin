import PropTypes from 'prop-types';
import React, { useState } from 'react';
import dayjs from 'dayjs';

// @mui
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers-pro';
import { AdapterDayjs } from '@mui/x-date-pickers-pro/AdapterDayjs';
import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';
import { styled, alpha } from '@mui/material/styles';
import { urlAdmin } from '../../../environment'

import { Toolbar, Tooltip, IconButton, Typography, OutlinedInput, InputAdornment } from '@mui/material';
// component
import Iconify from '../../../components/iconify';

import { useNavigate } from 'react-router-dom';
import utc from 'dayjs/plugin/utc'; // Import the UTC plugin
dayjs.extend(utc);
// ----------------------------------------------------------------------

const StyledRoot = styled(Toolbar)(({ theme }) => ({
    height: 96,
    display: 'flex',
    justifyContent: 'space-between',
    padding: theme.spacing(0, 1, 0, 3),
}));

const StyledSearch = styled(OutlinedInput)(({ theme }) => ({
    width: 240,
    transition: theme.transitions.create(['box-shadow', 'width'], {
        easing: theme.transitions.easing.easeInOut,
        duration: theme.transitions.duration.shorter,
    }),
    '&.Mui-focused': {
        width: 320,
        boxShadow: theme.customShadows.z8,
    },
    '& fieldset': {
        borderWidth: `1px !important`,
        borderColor: `${alpha(theme.palette.grey[500], 0.32)} !important`,
    },
}));

// ----------------------------------------------------------------------

UserListReportBar.propTypes = {
    numSelected: PropTypes.number,
    filterName: PropTypes.string,
    onFilterName: PropTypes.func,
};

export default function UserListReportBar({ setActivePage, setTotalRevenue, setProductsLoaded, setProducts, handleOpen2, numSelected, filterName, onFilterName }) {
    const [selectedRange, setSelectedRange] = useState([
        dayjs(''),
        dayjs(''),
    ]);
    const handleDateChange = (newRange) => {
        console.log(newRange)
        setSelectedRange(newRange);
        if (newRange && newRange[1]) {
            fetchProducts(newRange)

        }
    };

    const token = "Bearer " + localStorage.getItem("loginToken");
    const navigate = useNavigate()

    const fetchProducts = (newRange, pageNumber) => {
        setProductsLoaded(false);
        console.log(newRange)
        setActivePage(pageNumber)
        const startDate = dayjs(newRange[0]).add(0, 'day').format('YYYY-MM-DD');
        const endDate = dayjs(newRange[1]).add(0, 'day').format('YYYY-MM-DD');
        console.log(startDate, endDate)

        const url = `https://apis.rubypets.co.uk/admin/dashboard/revenue`;

        fetch(url, {
            method: "POST",
            headers: {
                Authorization: token,
            },
            body: JSON.stringify({
                "start": startDate,
                "end": endDate
            })
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.statusCode == 401) {
                    navigate("/login");
                }
                setProducts(data.data.totalRevenueList);
                let total_revenue = 0
                data.data.totalRevenueList.map((item) => {
                    total_revenue += item.revenue
                })
                setTotalRevenue(total_revenue)
                setProductsLoaded(true);
            })
            .catch((error) => {
                console.error(error);
            });
    };
    return (
        <StyledRoot
            sx={{
                ...(numSelected > 0 && {
                    color: 'primary.main',
                    bgcolor: 'primary.lighter',
                }),
            }}
        >
            {numSelected > 0 ? (
                <Typography component="div" variant="subtitle1">
                    {numSelected} selected
                </Typography>
            ) : (
                <>
                    <StyledSearch
                        value={filterName}
                        onChange={onFilterName}
                        placeholder="Search..."
                        startAdornment={
                            <InputAdornment position="start">
                                <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled', width: 20, height: 20 }} />
                            </InputAdornment>
                        }

                    />

                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DemoContainer components={['DateRangePicker']}>
                            <DateRangePicker
                                value={selectedRange}

                                onChange={handleDateChange} localeText={{ start: 'start-date', end: 'end-date' }} />
                        </DemoContainer>
                    </LocalizationProvider>
                </>

            )}

            {numSelected > 0 ? (
                <Tooltip title="Delete" >
                    <IconButton onClick={handleOpen2}>
                        <Iconify icon="eva:trash-2-fill" />
                    </IconButton>
                </Tooltip>
            ) : (
                ''
            )}
        </StyledRoot>
    );
}
