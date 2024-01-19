// PrescriptionList.js
"use client"
import React from 'react';
import { useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import { db } from '../../../lib/db'
import axios from 'axios';

async function getPrescription() {
    const response = await db.prescription.findMany({
        select: {
            id: true,
            patientName: true,
            doctorName: true,
            medication: true,
            createdAt: true,


        },
        orderBy: {
            createdAt: 'desc'
        }
    });
    return response;
}


const fetchPrescriptions = async () => {
    const { data } = await axios.get('/api/prescriptions');
    return data;
};

const PrescriptionList = async () => {
    const prescription = await getPrescription();
    console.log(prescription)


    const { data: prescriptions, status } = useQuery({
        queryKey:['prescriptions'], 
        queryFn: fetchPrescriptions});
        
    const queryClient = useQueryClient();

    const {mutate: approvePrescription} = useMutation({
       mutationFn: async (prescriptionId) => {
        return axios.post(`/api/prescriptions/${prescriptionId}/approve`)},
        
            onSuccess: () => {
                queryClient.invalidateQueries('prescriptions');
            },
        
    } );

    const {mutate: declinePrescription} = useMutation({
        mutationFn: async({ prescriptionId, reason }) => {
            return axios.post(`/api/prescriptions/${prescriptionId}/decline`, { reason })},
        
            onSuccess: () => {
                queryClient.invalidateQueries('prescriptions');
            },
        
        });

    if (status === 'loading') return <p>Loading...</p>;
    if (status === 'error') return <p>Error loading prescriptions</p>;

    return (
        <div>
            <table className="min-w-full divide-y divide-gray-200">
                <thead>
                    <tr>
                        <th>Prescription ID</th>
                        <th>Patient Name</th>
                        <th>Doctor Name</th>
                        <th>Medication</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {prescriptions?.map((prescription) => (
                        <tr key={prescription.id}>
                            <td>{prescription.id}</td>
                            <td>{prescription.patientName}</td>
                            <td>{prescription.doctorName}</td>
                            <td>{prescription.medication}</td>
                            <td>
                                <button
                                    onClick={() => approvePrescription.mutate(prescription.id)}
                                    className="mr-2 bg-green-500 text-white px-4 py-2 rounded"
                                >
                                    Approve
                                </button>
                                <button
                                    onClick={() => {
                                        const reason = prompt('Enter reason for decline:');
                                        if (reason) {
                                            declinePrescription.mutate({ prescriptionId: prescription.id, reason });
                                        }
                                    }}
                                    className="bg-red-500 text-white px-4 py-2 rounded"
                                >
                                    Decline
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default PrescriptionList;
